# FFC AHWR Front-end

> Front-end for Animal Health and Welfare Review

## Prerequisites

- Access to an instance of an
[Azure Service Bus](https://docs.microsoft.com/en-us/azure/service-bus-messaging/).
- Access to an instance of an
[Azure Storage Account](https://docs.microsoft.com/en-us/azure/storage/common/storage-account-overview).
  This could be an actual account or
  [Azurite](https://docs.microsoft.com/en-us/azure/storage/common/storage-use-azurite),
  a storage emulator
- Docker
- Docker Compose

Optional:

- Kubernetes
- Helm

### Environment variables

The following environment variables are required by the application.
Values for development are set in the Docker Compose configuration. Default
values for production-like deployments are set in the Helm chart and may be
overridden by build and release pipelines.

| Name                                    | Description                                                                                      |
| ----                                    | -----------                                                                                      |
| AZURE_STORAGE_CONNECTION_STRING         | Azure Storage connection string                                                                  |
| MESSAGE_QUEUE_HOST                      | Azure Service Bus hostname, e.g. `myservicebus.servicebus.windows.net`                           |
| MESSAGE_QUEUE_PASSWORD                  | Azure Service Bus SAS policy key                                                                 |
| MESSAGE_QUEUE_SUFFIX                    | Developer initials                                                                               |
| MESSAGE_QUEUE_USER                      | Azure Service Bus SAS policy name, e.g. `RootManageSharedAccessKey`                              |
| NOTIFY_API_KEY                          | GOV.UK Notify API Key                                                                            |
| NOTIFY_TEMPLATE_ID_FARMER_APPLY_LOGIN   | Id of email template used for farmer apply login email                                           |
| NOTIFY_TEMPLATE_ID_FARMER_CLAIM_LOGIN   | Id of email template used for farmer claim login email                                           |
| NOTIFY_TEMPLATE_ID_VET_LOGIN            | Id of email template used for vet login email                                                    |
| SERVICE_URI                             | URI of service (used in links, in emails) e.g. `http://localhost:3000` or `https://defra.gov.uk` |

## Running the application

The application is designed to run in containerised environments, using Docker
Compose in development and Kubernetes in production (a Helm chart is provided
for production deployments to Kubernetes).

Configuration and secret data are held in Azure Key Vault and populated during
the deployment to non-local environments.

*NOTE:*
User data is currently loaded from a file in Azure Storage, an example file is
available ([users.json](./data/users.json)) where the structure of the data can
be seen along with examples.
When running the application locally this file (or one matching the format)
needs to be uploaded to Azurite container that starts with the application. The
storage container the file resides in also needs to be created. The container
name is `users` and the file name is `users.json`.

### Build container image

Container images are built using Docker Compose, with the same images used to
run the service with either Docker Compose or Kubernetes.

When using the Docker Compose files in development the local `app` folder will
be mounted on top of the `app` folder within the Docker container, hiding the
CSS files that were generated during the Docker build. For the site to render
correctly locally `npm run build` must be run on the host system.

By default, the start script will build (or rebuild) images so there will
rarely be a need to build images manually. However, this can be achieved
through the Docker Compose
[build](https://docs.docker.com/compose/reference/build/) command:

```sh
# Build container images
docker-compose build
```

### Start

Use the [start script](./scripts/start) to run the service locally which in
turn uses Docker Compose.

## Test structure

The tests have been structured into subfolders of `./test` as per the
[Microservice test approach and repository structure](https://eaflood.atlassian.net/wiki/spaces/FPS/pages/1845396477/Microservice+test+approach+and+repository+structure)

### Running tests

A convenience script is provided to run automated tests in a containerised
environment. This will rebuild images before running tests via docker-compose,
using a combination of `docker-compose.yaml` and `docker-compose.test.yaml`.
The command given to `docker-compose run` may be customised by passing
arguments to the test script.

Examples:

```sh
# Run all tests
scripts/test

# Run tests with file watch
scripts/test -w
```

## CI pipeline

This service uses the
[FFC CI pipeline](https://github.com/DEFRA/ffc-jenkins-pipeline-library)

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT
LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and
applications when using this information.

> Contains public sector information licensed under the Open Government license
> v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her
Majesty's Stationery Office (HMSO) to enable information providers in the
public sector to license the use and re-use of their information under a common
open licence.

It is designed to encourage use and re-use of information freely and flexibly,
with only a few conditions.
