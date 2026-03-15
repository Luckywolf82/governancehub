export const Project = {
  name: 'Project',
  fields: {
    name: 'string',
    projectSlug: 'string|null',
    description: 'string|null',
    status: 'string',
    phase: 'string|null',
    owner: 'string|null',
    repoFullName: 'string|null',
    buildIntent: 'string|null',
    notes: 'string|null',
  },
};