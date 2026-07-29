// Every port this repo binds, in one place. If a demo starts listening
// somewhere new, add it here and the cleanup covers it everywhere.

export const PORTS = {
  hub: 3000,
  mpa: 3001,
  spa: 3002,
  ssr: 3003,
  shell: 3004,
  jamstack: 3005,
  pwa: 3006,
  graphqlWeb: 3007,
  remoteProducts: 3041,
  remoteCart: 3042,
  graphqlApi: 3071,
};

export const ALL_PORTS = Object.values(PORTS);
