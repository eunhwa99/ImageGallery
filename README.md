# ImageGallery

A full-stack **React + Flask** application demonstrating CI/CD deployment with **GitHub Actions, Jenkins, Helm, and Kubernetes**.
Users can view images from Unsplash, and the project showcases a complete cloud-native deployment workflow.

## 🚀 Features
 
* Frontend: React.js
* Backend: Flask (Python)
* Kubernetes deployment using **Helm charts**
* CI/CD pipeline:
  * GitHub Actions → build & push Docker images to GHCR
  * Jenkins → deploy to Kubernetes cluster
* Secrets management with Kubernetes Secrets (Unsplash API, GHCR token)
* Local Kubernetes testing with **Minikube**
* Ingress setup with NGINX for frontend/backend routing

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

* Docker
* Kubernetes CLI (`kubectl`)
* Helm
* Minikube (for local testing)
* Jenkins (local or server)
* GitHub repository & GHCR (GitHub Container Registry)
* Unsplash API Key


## 💻 Installation & Local Testing

1. **Clone the repository**

```bash
git clone https://github.com/<YOUR_GITHUB_USERNAME>/ImageGallery.git
cd ImageGallery
```

2. **Build Docker images**

```bash
# Backend
docker build -t my-backend:latest ./backend
# Frontend
docker build -t my-frontend:latest ./frontend
```

3. **Start Minikube and Build**

```bash
minikube start
minikube status

# Use Minikube's Docker daemon
eval $(minikube docker-env)
# Backend image
docker build -t my-backend:latest ./backend
# Frontend image
docker build -t my-frontend:latest ./frontend
```

> Alternatively, if you already have local images:

```bash
minikube image load my-backend:latest
minikube image load my-frontend:latest
```

4. **Create Kubernetes Secrets**

```bash
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=<USERNAME> \
  --docker-password=<TOKEN> \
  --docker-email=none

kubectl create secret generic unsplash-secret \
  --from-literal=UNSPLASH_ACCESS_KEY=<YOUR_UNSPLASH_KEY>
```

5. **Deploy with Helm**

```bash
helm upgrade --install image-gallery ./helm/image-gallery -f ./helm/image-gallery/values-dev.yaml
```

6. **Port-forward for local access**

```bash
kubectl port-forward svc/image-gallery-backend 8000:8000
kubectl port-forward svc/image-gallery-frontend 3000:3000
```

Access in browser: `http://localhost:3000`


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

* **ImagePullBackOff** → Check GHCR secret & imagePullSecrets in Helm values
* **Failed to authorize** → Ensure Kubernetes Secret exists
* **Nil pointer `.Values.backend.image`** → Ensure image values in `values-*.yaml`
* **Ingress ADDRESS `<none>`** → Add `spec.ingressClassName: nginx`, enable NGINX controller
* **Path conflicts on same host** → Use single Ingress with path rules or separate hosts
* **ClusterIP access issue** → Use port-forwarding or `minikube tunnel`


## 🔗 References / Blog Series

* [CI/CD Part 1: Project Setup & GitHub Actions](https://silver-programmer.tistory.com/entry/ReactFlask-어플리케이션-코드부터-Jenkins-배포까지-CICD-1)
* [CI/CD Part 2: Jenkins Integration & Deployment](https://silver-programmer.tistory.com/entry/ReactFlask-어플리케이션-코드부터-Jenkins-배포까지-CICD-2)
* [CI/CD Part 3: Ingress & Kubernetes](https://silver-programmer.tistory.com/entry/ReactFlask-어플리케이션-코드부터-Jenkins-배포까지-CICD-3-Ingress-활용하기)


