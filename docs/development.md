# Development

This integration focuses on Mimecast and is using the Mimecast API for
interacting with resources.

## Mimecast account setup

It is assumed you have admin access to your mimecast account. In the mimecast
admin console:

- go to Administration -> Services -> API and Platform Integrations
- go to the `Your Application Integrations` category
- click on `Add API Application` or click on an existing enabled Application in
  this section
- here you will be able to view the `Application ID` and `Application Key`,
  which you will need for authentication.
- If you have not already generated keys, do so now by clicking the
  `Create Keys` option
- Save the contents of the `accessKey` and `secretKey` generated. They will be
  needed for authentication

## Authentication

Copy the `.env.example` to `.env` file and fill in the variables using the user
information and API token information generated from instructions above. The
mapping is as follows:

- CLIENT_ID= ${`accessKey`}
- CLIENT_SECRET= ${`secretKey`}
- APP_KEY= ${`Application Key`}
- APP_ID= ${`Application ID`}
