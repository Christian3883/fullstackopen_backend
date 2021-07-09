const express = require('express')
const app = express()

const Sentry = require('@sentry/node')
const Tracing = require('@sentry/tracing')

Sentry.init({
  dsn: process.env.SENTRY_URI,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Tracing.Integrations.Express({ app })
  ],
  tracesSampleRate: 1.0
})

const setHeadersHandlers = () => {
  app.use(Sentry.Handlers.requestHandler())
  app.use(Sentry.Handlers.tracingHandler())
}

const setErrorHandler = () => {
  app.use(Sentry.Handlers.errorHandler())
}

module.exports = {
  setHeadersHandlers,
  setErrorHandler
}
