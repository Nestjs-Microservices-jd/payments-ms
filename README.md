# se usó stripe y hookdeck para hacer las pruebas local

https://dashboard.stripe.com/test/workbench/webhooks

https://dashboard.hookdeck.com/events

## Para que funcione el weebhook
```
hookdeck listen [port] [source name]
```

## Prod

```
docker build -f dockerfile.prod -t payment-ms .
```
