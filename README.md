# ecs-backend
Client (app.konkas.tech) → CloudFront → S3 (static hosting)
                                      ↘ ALB → ECS (Node.js backend)
                                               ↘ RDS (MySQL database)
