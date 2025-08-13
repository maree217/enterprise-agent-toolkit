from fastapi import APIRouter

from app.api.routes import (apikeys, graphs, groups, llmmodel, login, members,
                            provider, roles, subgraphs, teams, threads,
                            toolprovider, tools, uploads, users, utils)

api_router = APIRouter()
api_router.include_router(login.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(utils.router, prefix="/utils", tags=["utils"])
api_router.include_router(teams.router, prefix="/teams", tags=["teams"])
api_router.include_router(
    members.router, prefix="/teams/{team_id}/members", tags=["members"]
)
api_router.include_router(tools.router, prefix="/tools", tags=["tools"])
api_router.include_router(
    toolprovider.router, prefix="/toolprovider", tags=["toolprovider"]
)
api_router.include_router(
    threads.router, prefix="/teams/{team_id}/threads", tags=["threads"]
)
api_router.include_router(uploads.router, prefix="/uploads", tags=["uploads"])


api_router.include_router(provider.router, prefix="/provider", tags=["provider"])

api_router.include_router(llmmodel.router, prefix="/model", tags=["model"])
api_router.include_router(
    graphs.router, prefix="/teams/{team_id}/graphs", tags=["graphs"]
)
api_router.include_router(
    apikeys.router, prefix="/teams/{team_id}/api-keys", tags=["api-keys"]
)
api_router.include_router(
    subgraphs.router, prefix="/teams/{team_id}/subgraphs", tags=["subgraphs"]
)

# 新增的公共路由
api_router.include_router(
    subgraphs.public_router, prefix="/subgraphs", tags=["subgraphs"]
)

# 添加langmanus路由
# api_router.include_router(langmanus.router, prefix="/langmanus", tags=["langmanus"])

# RBAC相关路由
api_router.include_router(groups.router, prefix="/groups", tags=["groups"])
api_router.include_router(roles.router, prefix="/roles", tags=["roles"])
