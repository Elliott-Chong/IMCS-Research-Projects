// @Elliott this is the schema for the socket
// @Elliott I'm using hard links to this file in the frontend and backend so that they are always in sync
// https://www.redhat.com/sysadmin/linking-linux-explained
// this is the hard linking command i ran: ln backend/socket.schema.ts ./src/socket.schema.ts
export type mouseMoveClient = {
  mousePosition: {
    x: number;
    y: number;
  };
};

export type mouseMoveServer = {
  mousePosition: {
    x: number;
    y: number;
  };
  id: string;
};
