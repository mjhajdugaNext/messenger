import { DecodeResult, ExpirationStatus, Session } from '../modules/users/user.interface';
import { checkExpirationStatus, decodeSession, encodeSession } from '../modules/users/jwt.utils';
import { type Socket } from 'socket.io';
import { ApiError } from '../shared/errors';

export function socketAuthenticate(socket: Socket, next: Function) {
    const authToken = socket.handshake.auth.token;

    const decodedSession: DecodeResult = decodeSession(authToken);

    if (decodedSession.type === "integrity-error" || decodedSession.type === "invalid-token") {
        next(new ApiError({ message: `Failed to decode or validate authorization token. Reason: ${decodedSession.type}.`, httpCode: 401 }))
        return;
    }
  
    const expiration: ExpirationStatus = checkExpirationStatus(decodedSession.session);
  
    if (expiration === "expired") {
        next(new ApiError({ message: 'Authorization token has expired. Please create a new authorization token.', httpCode: 401 }))
        return;
    }
  
    let session: Session;
  
    if (expiration === "grace") {
        // Automatically renew the session and send it back with the response
        const { token, expires, issued } = encodeSession(decodedSession.session);
        session = {
            ...decodedSession.session,
            expires: expires,
            issued: issued
        };
  
        socket.handshake.auth.token = token;
        
        socket.emit(`/token_refresh/${decodedSession.session._id}`, { token })
        next();
        return;
    } else {
        session = decodedSession.session;
    }
  
    // Set the session on response.locals object for routes to access
    socket.data = session;
    // Request has a valid or renewed session. Call next to continue to the authenticated route handler
    next();
  }