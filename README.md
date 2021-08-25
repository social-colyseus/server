# SocialColyseus - Server

SocialColyseus - Server is an extensions for Colyseus. This package adds Authentication, Friendship, Invitation System
and more to Colyseus servers. SocialColyseus uses MongoDB for database. It also provides Rest API.

## How to use?

### Env File

First copy .env.template to .env file and fill the necessary fields.

```typescript
import * as dotenv from 'dotenv';

dotenv.config();
```

### Initialize Express

```typescript
import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());
```

### Create Game Server

```typescript
import {createServer} from 'http';
import {Server} from 'colyseus';
import {WebSocketTransport} from '@colyseus/ws-transport';

const server = createServer(app);

const gameServer = new Server({
    transport: new WebSocketTransport({
        server,
    }),
});
```

### Import SocialColyseus App

```typescript
import {SocialColyseusApp} from '../index';

const socialApp = new SocialColyseusApp(gameServer, {
    database: {
        host: process.env.DB_HOST,
        name: process.env.DB_NAME,
        pass: process.env.DB_PASS,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
    },
});
app.use(socialApp.httpHandler());
```

### Define your room via SocialColyseus

Otherwise authentication and other features won't work

```typescript
socialApp.defineRoom('privateRoom', PrivateRoom);
```

### SocialColyseus Rooms

Now add SocialColyseus App to your rooms for authentication and other features

```typescript
export class PrivateRoom extends Room {
    protected app: SocialColyseusApp;

    onCreate(options: any): void | Promise<any> {
        if (!options.app) {
            return Promise.reject();
        }
        this.app = options.app; // Initializes SocialColyseus to your room
        this.setPrivate(true).finally();
    }

    onAuth(client: Client, options: any): any {
        return authenticate(this.app, {token: options?.token}); // Authenticates your user via token
    }
}
```

### Run your server

```typescript
gameServer.listen(5567, '0.0.0.0').finally();
```

## Roadmap

- [ ] Room Invitation
- [ ] Leaderboard
- [ ] Clans
- [ ] Parties

## Note

This package is not version 1.0.0, it may or may not get breaking changes. Use it at your own risk on production
environment.
