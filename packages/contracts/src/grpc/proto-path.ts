import { join } from 'node:path';

export function getWatchPartySupportProtoPath(): string {
  return join(__dirname, '..', '..', 'proto', 'watch-party-support.proto');
}
