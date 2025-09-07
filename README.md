# ImageGallery

A full-stack **React + Flask** image gallery application demonstrating **automated CI/CD pipelines** with **GitHub Actions, Jenkins, Docker, Helm, and Kubernetes**.  
This project is _primarily for learning and experimentation_, simulating a production-like environment to practice DevOps workflows.

## 🚀 Features
- Frontend: React.js
- Backend: Flask (Python)
- Kubernetes deployment using **Helm charts**
- CI/CD pipeline:
  - **GitHub Actions** → build & push Docker images to **GHCR**
  - **Jenkins** → deploy to **Kubernetes cluster**
- Secrets management with Kubernetes Secrets (Unsplash API, GHCR token)
- Local Kubernetes testing with **Minikube**
- NGINX Ingress for routing frontend and backend traffic
- Problem-solving experience: ImagePullBackOff, nil pointer, Ingress ADDRESS issues, ClusterIP access, etc.

## 📂 Project Structure

```

ImageGallery/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── Config.js
│   │   ├── index.js
│   ├── package.json
│   └── Dockerfile
├── helm/
└── image-gallery/                # Helm chart
    ├── Chart.yaml
    ├── values.yaml
    ├── values-dev.yaml
    └── templates/
         ├── backend-deployment.yaml
         ├── backend-ingress.yaml
         ├── frontend-deployment.yaml
         ├── frontend-ingress.yaml
         └── service.yaml

```

## ⚙️ Prerequisites

- Docker
- Kubernetes CLI (`kubectl`)
- Helm
- Minikube
- Jenkins (local or server)
- GitHub repository & GHCR (GitHub Container Registry)
- Unsplash API Key

## 💻 How to Build & Run Locally (Minikube)

```bash
# Start Minikube
minikube start

# Use Minikube's Docker daemon so Minikube can access local images
eval $(minikube docker-env)

# Build Docker images locally
docker build -t my-backend:latest ./backend
docker build -t my-frontend:latest ./frontend

# Optional: Load images into Minikube (if not using Docker daemon directly)
minikube image load my-backend:latest
minikube image load my-frontend:latest

# Create Kubernetes Secrets

## 1. GHCR Secret (optional)
# Only needed if you are using GitHub Container Registry (GHCR) or any private registry.
# Kubernetes uses this secret to pull private images.
# If using local images with Minikube Docker daemon, you can skip this step.

kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=<YOUR_GITHUB_USERNAME> \
  --docker-password=<YOUR_PERSONAL_ACCESS_TOKEN> \
  --docker-email=none

# Reference the secret in your Helm values or Deployment manifests if needed
# imagePullSecrets:
#   - name: ghcr-secret

## 2. Unsplash API Secret (required)
kubectl create secret generic unsplash-secret \
  --from-literal=UNSPLASH_ACCESS_KEY=<YOUR_UNSPLASH_KEY>

# Deploy with Helm
helm upgrade --install image-gallery ./helm/image-gallery \
  -f ./helm/image-gallery/values-dev.yaml \
  --kube-context minikube

# =========================================
# Option 1: Port-forward for local access
# =========================================
kubectl port-forward svc/image-gallery-backend 8000:8000
kubectl port-forward svc/image-gallery-frontend 3000:3000

# Access the app in your browser at `http://localhost:3000`

# =========================================
# Option 2: Ingress for local access
# =========================================
# Enable NGINX Ingress controller in Minikube
minikube addons enable ingress

# Start tunnel (required for Ingress to work in Minikube)
minikube tunnel

# Add host entry (Linux/Mac)
echo "127.0.0.1 myapp.local" | sudo tee -a /etc/hosts

# Now you can access:
# Backend:  http://myapp.local/api
# Frontend: http://myapp.local/

```


## 🛠 CI/CD Overview

* **GitHub Actions**:

  * Trigger on `main` branch push
  * Build Docker images for frontend & backend
  * Push images to GHCR
  * Trigger Jenkins Job via webhook

* **Jenkins Pipeline**:

  * Clean workspace & pull latest code
  * Login to GHCR
  * Create Kubernetes secrets
  * Deploy Helm chart to Kubernetes cluster
  * Verify pods

* **Secrets Management**:

  * GHCR credentials (`ghcr-credentials`)
  * Unsplash API key (`UNSPLASH_KEY`)

* **Ingress Setup**:

  * NGINX Ingress Controller
  * Backend & Frontend routing
  * Supports path-based routing or separate hosts
  * Optional rewrite annotations


## 🔧 Troubleshooting

1. ❌ **ImagePullBackOff**

   * Cause: GHCR authentication issue
   * Fix: Create `ghcr-secret` & add `imagePullSecrets` in Helm values

2. ❌ **Failed to authorize**

   * Cause: Secret missing
   * Fix: Ensure Kubernetes Secret exists and referenced

3. ❌ **Nil pointer `.Values.backend.image`**

   * Cause: image value missing in `values-*.yaml`
   * Fix: Define `backend.image` and `frontend.image` in values

4. ❌ **Ingress ADDRESS `<none>`**

   * Cause: `IngressClassName` not set or Ingress Controller inactive
   * Fix: Add `spec.ingressClassName: nginx` and enable NGINX Ingress (`minikube addons enable ingress`)

5. ❌ **Path conflicts on same host**

   * Cause: Multiple Ingress share same host
   * Fix: Use single Ingress with path rules or separate hosts

6. ❌ **ClusterIP access issue**

   * Cause: ClusterIP not externally accessible
   * Fix: Use `kubectl port-forward` or `minikube tunnel`


## 🔗 My Blog Series

* [CI/CD Part 1: Project Setup & CI/CD with docker-compose](https://silver-programmer.tistory.com/entry/ReactFlask-어플리케이션-코드부터-Jenkins-배포까지-CICD-1)
* [CI/CD Part 2: Jenkins Integration & Deployment using Kubernetes](https://silver-programmer.tistory.com/entry/ReactFlask-어플리케이션-코드부터-Jenkins-배포까지-CICD-2)
* [CI/CD Part 3: Jenkins Integration & Deployment using Ingress ](https://silver-programmer.tistory.com/entry/ReactFlask-어플리케이션-코드부터-Jenkins-배포까지-CICD-3-Ingress-활용하기)

## 📌 Note

This project is **primarily for learning and experimentation**, but it demonstrates practical experience with:

* Automated CI/CD pipelines
* Containerization with Docker
* Kubernetes orchestration with Helm
* Secret management & Ingress configuration
* Troubleshooting

It is suitable for showcasing **DevOps, backend, and cloud skills**.

## Demo
![Image](https://github.com/user-attachments/assets/4dda92a8-5af0-4f9a-82c7-f6c3a03feade)
