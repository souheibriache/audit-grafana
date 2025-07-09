# Système d'Audit et de Monitoring - Projet M1

## 📋 Description

Ce projet M1 implémente un système d'audit et de monitoring utilisant :
- **Prometheus** : Collecte des métriques
- **Grafana** : Visualisation des données
- **Node Exporter** : Métriques système
- Application Frontend et Backend

## 🚀 Installation et Démarrage

### 1. Lancer le stack de monitoring

```bash
# Démarrer tous les services Docker
docker-compose up -d
```

### 2. Démarrer l'application Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Démarrer l'application Backend

```bash
cd backend
npm install
npm start
```

## 🌐 Accès aux Services

| Service | URL | Port |
|---------|-----|------|
| **Frontend** | http://localhost:3000 | 3000 |
| **Backend** | http://localhost:4500 | 4500 |
| **Grafana** | http://localhost:3001 | 3001 |
| **Prometheus** | http://localhost:9090 | 9090 |
| **Node Exporter** | http://localhost:9100 | 9100 |
| **SonarQube** | http://localhost:9000 | 9000 |

### Identifiants par défaut
- **Grafana** : admin / admin
- **SonarQube** : admin / admin

## 🔧 Commandes Utiles

```bash
# Arrêter tous les services
docker-compose down

# Voir les logs
docker-compose logs -f

# Redémarrer les services
docker-compose restart
```
