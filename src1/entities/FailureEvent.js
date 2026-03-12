export const FailureEvent = {
  name: 'FailureEvent',
  fields: {
    eventType: 'string',
    severity: 'string',
    sourceKey: 'string',
    entityType: 'string',
    payloadSummary: 'string',
    createdAt: 'date',
    resolvedAt: 'date',
  },
};
