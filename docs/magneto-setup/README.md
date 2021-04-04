# Bitnami Magento setup

## Create integration user
1. In admin dashboard (/admin in browser) go to System > Integrations
2. Click "Add New Integration"
3. Provide name and the existing "user" password
4. Under API tab, provide access
5. Save
6. Click activate, and the access token is provided


## AWS EC2 Setup

Go to AWS Marketplace for Official Magento AMI
https://aws.amazon.com/marketplace/pp/Bitnami-Magento-Certified-by-Bitnami/B00NNZTA6Y

Follow instructions to start EC2 instance

Connect to ec2 instance:
```bash
ssh -i "your-key.pem" bitnami@ec2-00-000-00-00.eu-central-1.compute.amazonaws.com

# Show admin password
sudo cat /home/bitnami/bitnami_credentials

```

Connect Admin interface in browser:
http://<public-iip>/admin/


## Local setups using docker compose

```bash
cd magento-local
docker compose up

```
* https://hub.docker.com/r/bitnami/magento/
* https://github.com/bitnami/bitnami-docker-magentos


