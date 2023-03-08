# Document generation

Document generation is done using Common Hosted Document Generation Service
[CDOGS](https://bcgov.github.io/common-service-showcase/services/cdogs.html)

## How to

### Manual option using Postman

### Prerequisites:

- Postman
- LibreOffice or Microsoft Word (LibreOffice is preferred since CDOGS uses Carbone which uses LibreOffice for pdf generation)

### Demo:

demo-app.docx is am example of template that demonstrates usage of:

- conditional rendering
- chaining of conditions
- arrays

#### Steps

- navigate to [CDOGS](https://bcgov.github.io/common-service-showcase/services/cdogs.html)
- download postman collection and README.md
- populate collection variables in Postman in accordance with README and CDOGS Postman collection documentation
- send authentication request using postman
- navigate to 'upload template and generate' request
- encode pdf using base64  
  if you are on mac use following command to copy base64 to clipboard:
  ```bash
  base64 -i demo-app.docx| pbcopy
  ```
- insert encoded values into body -> template -> content

Example of Body

```json
{
  "data": {
    "noData": "No Data",
    "fileNumber": "100009",
    "applicant": "Test applicant",
    "status": "In Progress",
    "type": "Non-Farm Use",
    "parcels": [
      {
        "index": "1",
        "pid": "0123321123",
        "pin": null,
        "legalDescription": "some legal description",
        "mapAreaHectares": 0.05,
        "isFarm": true,
        "parcelType": "application",
        "ownershipType": "Fee Simple",
        "purchasedDate": "2023-01-01",
        "documents": [],
        "owners": [
          {
            "uuid": "cf211423-78e6-4617-b580-ff7d32211325",
            "firstName": "Test",
            "lastName": "Applicant",
            "organizationName": null,
            "phoneNumber": "1111111111",
            "email": "test@11.11",
            "displayName": "Test Applicant"
          },
          {
            "uuid": "02669170-a639-4eee-bf4a-c7d3a755cdcf",
            "firstName": "Test",
            "lastName": "2",
            "organizationName": null,
            "phoneNumber": "1111111111",
            "email": "222@22.22",
            "displayName": "Test 2"
          }
        ]
      },
      {
        "index": "2",
        "uuid": "9e2346ba-0138-41b5-af1d-d5eb1c505595",
        "pid": "0123321123",
        "pin": null,
        "legalDescription": "this is another legal description",
        "mapAreaHectares": 0.04,
        "isConfirmedByApplicant": false,
        "crownLandOwnerType": null,
        "parcelType": "application",
        "ownershipType": "Fee Simple",
        "documents": [],
        "owners": []
      }
    ]
  },
  "formatters": "{\"myFormatter\":\"_function_myFormatter|function(data) { return data.slice(1); }\",\"myOtherFormatter\":\"_function_myOtherFormatter|function(data) {return data.slice(2);}\"}",
  "options": {
    "cacheReport": true,
    "convertTo": "pdf",
    "overwrite": true,
    "reportName": "alcs-demo.pdf"
  },
  "template": {
    "encodingType": "base64",
    "fileType": "docx",
    "content": "your encoded template"
  }
}
```
