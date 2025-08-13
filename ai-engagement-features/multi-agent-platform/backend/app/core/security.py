import secrets
from datetime import datetime, timedelta
from typing import Any

import jwt
from cryptography.fernet import Fernet
from fastapi import HTTPException
from passlib.context import CryptContext
from sqlmodel import Session

from app.core.config import settings
from app.db.models import ActionType, Resource, ResourceType, User


class SecurityManager:
    def __init__(self):
        # 密码加密上下文
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        # JWT算法
        self.jwt_algorithm = "HS256"
        # Fernet加密实例
        self._key = (
            settings.MODEL_PROVIDER_ENCRYPTION_KEY.encode()
            if settings.MODEL_PROVIDER_ENCRYPTION_KEY
            else Fernet.generate_key()
        )
        self._fernet = Fernet(self._key)

    def create_access_token(self, subject: str | Any, expires_delta: timedelta) -> str:
        """创建JWT访问令牌"""
        expire = datetime.utcnow() + expires_delta
        to_encode = {"exp": expire, "sub": str(subject)}
        encoded_jwt = jwt.encode(
            to_encode, settings.SECRET_KEY, algorithm=self.jwt_algorithm
        )
        return encoded_jwt

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """验证密码"""
        return self.pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        """获取密码哈希值"""
        return self.pwd_context.hash(password)

    def generate_apikey(self) -> str:
        """生成API密钥"""
        return secrets.token_urlsafe(32)

    def generate_short_apikey(self, key: str) -> str:
        """生成短格式API密钥"""
        return f"{key[:4]}...{key[-4:]}"

    def encrypt_api_key(self, data: str) -> str:
        """加密API密钥"""
        if not data:
            return data
        return self._fernet.encrypt(data.encode()).decode()

    def decrypt_api_key(self, encrypted_data: str) -> str:
        """解密API密钥"""
        if not encrypted_data:
            return encrypted_data
        try:
            return self._fernet.decrypt(encrypted_data.encode()).decode()
        except Exception as e:
            raise ValueError("Decryption failed,Invalid API key Token") from e


class ResourceManager:
    @staticmethod
    def create_resource(
        session: Session,
        name: str,
        description: str,
        resource_type: ResourceType,
        resource_id: str | None = None,
    ) -> Resource:
        """创建资源记录"""
        resource = Resource(
            name=name,
            description=description,
            type=resource_type,
            resource_id=resource_id,
        )
        session.add(resource)
        session.flush()  # 获取resource.id
        return resource

    @staticmethod
    def check_permission(
        session: Session,
        user: User,
        resource_type: ResourceType,
        action_type: ActionType,
        resource_id: str | None = None,
        raise_exception: bool = True,
    ) -> bool:
        """检查用户是否有权限执行特定操作

        Args:
            session: 数据库会话
            user: 用户对象
            resource_type: 资源类型
            action_type: 操作类型
            resource_id: 具体资源ID（可选）
            raise_exception: 是否在没有权限时抛出异常

        Returns:
            bool: 是否有权限

        Raises:
            HTTPException: 当raise_exception=True且没有权限时抛出
        """
        # 超级用户拥有所有权限
        if user.is_superuser:
            return True

        has_permission = False

        # 通过用户的角色检查权限
        for role in user.roles:
            for access in role.accesses:
                if (
                    access.resource.type == resource_type
                    and access.action == action_type
                ):
                    # 如果是资源类型级别的权限检查
                    if resource_id is None and access.resource.resource_id is None:
                        has_permission = True
                        break
                    # 如果是具体资源实例的权限检查
                    if resource_id and access.resource.resource_id == resource_id:
                        has_permission = True
                        break
            if has_permission:
                break

        # 如果角色没有权限，通过用户组检查权限
        if not has_permission:
            for group in user.groups:
                for resource in group.resources:
                    if resource.type == resource_type:
                        # 如果是资源类型级别的权限检查
                        if resource_id is None and resource.resource_id is None:
                            has_permission = True
                            break
                        # 如果是具体资源实例的权限检查
                        if resource_id and resource.resource_id == resource_id:
                            has_permission = True
                            break
                if has_permission:
                    break

        if not has_permission and raise_exception:
            raise HTTPException(
                status_code=403,
                detail=f"Not enough permissions to {action_type} {resource_type.value}",
            )

        return has_permission


# 创建单例实例
security_manager = SecurityManager()
resource_manager = ResourceManager()

# 为了保持向后兼容，保留原有的函数接口
create_access_token = security_manager.create_access_token
verify_password = security_manager.verify_password
get_password_hash = security_manager.get_password_hash
generate_apikey = security_manager.generate_apikey
generate_short_apikey = security_manager.generate_short_apikey
encrypt_token = security_manager.encrypt_api_key
decrypt_token = security_manager.decrypt_api_key
