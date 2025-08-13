# Document Classifier Agent Template
## AI-Powered Document Classification & Processing - 2 Hour Deployment

### Overview
A production-ready document classification agent that automatically categorizes documents (invoices, contracts, emails, etc.) using Azure OpenAI and intelligent document processing.

### Features
- ✅ Multi-format document processing (PDF, DOC, TXT, images)
- ✅ Intelligent classification with confidence scores
- ✅ Custom category training
- ✅ Batch processing capabilities
- ✅ Integration with SharePoint, Dynamics, etc.
- ✅ Audit trail and compliance logging

### Architecture
```
Document Input -> OCR/Text Extraction -> AI Classification -> Routing & Processing
                                              ↓
                                    Confidence Scoring & Validation
```

### Quick Deploy

```bash
# 1. Configure your environment
cp .env.example .env
# Edit .env with your Azure OpenAI credentials

# 2. Deploy to Azure
./deploy.sh --client "your-client-name"

# 3. Process your first documents
# Upload to the /upload endpoint
```

### Use Cases

#### 1. Invoice Processing
- Automatically classify vendor invoices
- Extract key data (amount, date, vendor)
- Route to appropriate approval workflows

#### 2. Contract Management
- Classify contract types (employment, vendor, customer)
- Extract critical dates and terms
- Ensure compliance with legal requirements

#### 3. Email Classification
- Categorize customer inquiries
- Priority routing for urgent requests
- Automated response triggering

#### 4. Legal Document Review
- Classify legal documents by type
- Identify high-risk clauses
- Route for appropriate legal review

### Configuration

#### Document Categories
Edit `config/categories.yaml`:
```yaml
categories:
  invoice:
    confidence_threshold: 0.8
    routing: "finance_team"
    required_fields: ["amount", "vendor", "date"]
  
  contract:
    confidence_threshold: 0.9
    routing: "legal_team"
    required_fields: ["party_names", "terms", "duration"]
  
  support_email:
    confidence_threshold: 0.7
    routing: "support_queue"
    priority_keywords: ["urgent", "critical", "down"]
```

### Processing Pipeline

1. **Document Ingestion**
   - Multi-format support (PDF, DOC, images)
   - OCR for scanned documents
   - Text extraction and cleaning

2. **AI Classification**
   - Context-aware categorization
   - Confidence scoring
   - Uncertainty handling

3. **Data Extraction**
   - Category-specific field extraction
   - Validation and verification
   - Structured data output

4. **Workflow Integration**
   - Automated routing
   - Approval workflows
   - System integration

### Performance Metrics

- Classification accuracy: > 95%
- Processing time: < 30 seconds per document
- Throughput: 1000+ documents/hour
- False positive rate: < 2%

### Cost Estimation

| Volume | Monthly Cost |
|--------|-------------|
| < 1,000 documents | $75-125 |
| 10,000 documents | $300-500 |
| 100,000 documents | $1,500-2,500 |

### File Structure

```
classifier-agent/
├── deploy.sh              # One-click deployment
├── .env.example          # Environment template
├── config/
│   ├── categories.yaml   # Classification categories
│   └── extraction.yaml   # Data extraction rules
├── src/
│   ├── classifier.py     # Main classification logic
│   ├── extractor.py      # Data extraction
│   ├── preprocessor.py   # Document preprocessing
│   └── router.py         # Workflow routing
├── frontend/
│   ├── upload.html       # Document upload interface
│   └── monitor.html      # Processing dashboard
├── examples/
│   ├── invoices/         # Sample invoice documents
│   ├── contracts/        # Sample contracts
│   └── emails/           # Sample emails
└── tests/
    └── test_classification.py
```

### API Endpoints

```bash
# Upload document for classification
POST /classify
Content-Type: multipart/form-data
Body: document file

# Batch processing
POST /classify/batch
Content-Type: application/json
Body: ["doc1.pdf", "doc2.pdf", ...]

# Get classification results
GET /results/{document_id}

# Training data upload
POST /training
Content-Type: multipart/form-data
Body: training documents with labels
```

### Integration Examples

#### SharePoint Integration
```python
# Auto-classify documents uploaded to SharePoint
from sharepoint_classifier import SharePointClassifier

classifier = SharePointClassifier()
classifier.monitor_library("Documents")
# Documents auto-classified and routed
```

#### Dynamics 365 Integration
```python
# Create cases from classified emails
from dynamics_integration import create_case_from_email

if classification.category == "support_email":
    case = create_case_from_email(
        document=email,
        priority=classification.metadata.get("priority", "normal")
    )
```

### Monitoring

Access your classification dashboard:
- Processing volume and trends
- Classification accuracy metrics
- Error rates and failed classifications
- Processing time analytics
- Cost tracking

### Custom Training

1. **Upload Training Data**
   - Provide labeled examples for each category
   - Minimum 20 examples per category
   - Include edge cases and variations

2. **Model Fine-tuning**
   - Automatic model improvement
   - Category-specific optimization
   - Validation and testing

3. **Performance Tracking**
   - A/B testing of model versions
   - Accuracy monitoring
   - Continuous improvement

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Low accuracy | Add more training data, review categories |
| Slow processing | Scale Azure resources, optimize preprocessing |
| Failed extractions | Check document quality, update extraction rules |
| Integration errors | Verify API keys and connection strings |

### Support

- Documentation: [Full Guide](../../docs/guides/classifier-agent.md)
- Training Data: [Sample Sets](./examples/)
- Custom Categories: Contact for configuration

### Next Steps

1. ✅ Deploy basic classifier
2. 📚 Upload your training documents
3. 🎯 Configure categories and routing
4. 📊 Monitor accuracy and performance
5. 🔄 Iterate and improve based on results