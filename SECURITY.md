# 🔒 Security Policy

## Environment Variables and Secrets Management

**⚠️ IMPORTANT: This repository does NOT contain any production secrets.**

All sensitive configuration values have been removed and replaced with placeholders. Before running this application, you MUST configure your own secure credentials.

### Required Configuration

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Generate secure secrets:**

   **JWT Secret** (Required):
   ```bash
   # Linux/Mac
   openssl rand -base64 64

   # Windows PowerShell
   [Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

   # Online
   # Visit: https://generate-random.org/api-key-generator
   ```

   **SQL Server Password** (Required):
   - Minimum 8 characters
   - Must contain: uppercase, lowercase, number, special character
   - Example: `MyStr0ng!Pass`

3. **Update `.env` file with your secrets:**
   ```env
   SQL_SA_PASSWORD=your_generated_password_here
   JWT_SECRET=your_generated_jwt_secret_here
   ```

### Files to Configure

| File | Purpose | Action Required |
|------|---------|-----------------|
| `.env` | Local environment variables | Create from `.env.example` and add secrets |
| `backend/src/TemperatureControl.API/appsettings.json` | API configuration | Uses environment variables - no changes needed |
| `docker-compose.yml` | Docker configuration | Uses `.env` file - no changes needed |

### Security Best Practices Implemented

✅ **No hardcoded credentials** in source code
✅ **Environment variables** for all secrets
✅ **.env files** excluded from git
✅ **Example files** provided as templates
✅ **SQL injection protection** via parameterized queries
✅ **Password hashing** with BCrypt
✅ **JWT token authentication**
✅ **CORS** properly configured
✅ **HTTPS ready** for production

### Production Deployment

**Never use default or example passwords in production!**

For production deployments:

1. **Use a secret management service:**
   - Azure Key Vault
   - AWS Secrets Manager
   - HashiCorp Vault
   - GitHub Secrets (for CI/CD)

2. **Rotate secrets regularly**

3. **Use different secrets per environment:**
   - Development
   - Staging
   - Production

4. **Enable HTTPS** and use strong TLS configuration

5. **Review and update** dependencies regularly

## Reporting Security Vulnerabilities

If you discover a security vulnerability, please email: **security@yourcompany.com**

**Please do NOT create public GitHub issues for security vulnerabilities.**

## Security Checklist for Developers

Before deploying:

- [ ] All `.env` files are in `.gitignore`
- [ ] No hardcoded passwords in code
- [ ] Generated strong JWT secret
- [ ] Changed default SQL Server password
- [ ] SMTP credentials not exposed
- [ ] HTTPS enabled in production
- [ ] CORS configured with specific origins
- [ ] Rate limiting enabled
- [ ] Database backups configured
- [ ] Audit logging enabled

## Dependencies Security

We use automated tools to check for vulnerable dependencies:

- **Dependabot** (GitHub) - Automated dependency updates
- **.NET Security Advisories** - Monitored via GitHub
- **npm audit** - Regular frontend dependency audits

## Compliance

This application follows:
- OWASP Top 10 security practices
- Industry standard authentication patterns
- Secure coding guidelines

---

**Last Updated:** 2024-01-15
**Security Contact:** security@yourcompany.com
