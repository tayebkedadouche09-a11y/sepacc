# NUMI 4.0.0 FINAL

## Production completion
- Customer Instance engine with `customer_instances` table
- Saga tracking (INSTANCE_CREATED → DELIVERY_READY)
- Master / Version / Instance isolation on purchase path
- Honest readiness gate (URL + source + license + health)
- Env-only configuration, preflight, setup scripts
- Database / secrets / email provider abstractions
- Native GitHub + Vercel provisioning with optional customer DB

## Reality rule
NOT_CONFIGURED when credentials missing. No fake READY / PAID / CONNECTED.
