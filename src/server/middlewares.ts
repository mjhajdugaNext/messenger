import { NextFunction, Request, Response } from 'express';
import { ApiError, ValidationError } from '../shared/errors';
import { JWT_HADER_NAME, JWT_RENEWED_HADER_NAME } from '../config';
import { DecodeResult, ExpirationStatus, Session } from '../modules/users/user.interface';
import { checkExpirationStatus, decodeSession, encodeSession } from '../modules/users/jwt.utils';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ValidationError) {
    const { message, httpCode, logging, stack, errors } = err;

    if (logging) console.error(JSON.stringify({ httpCode, message, stack, errors }));

    return res.status(httpCode).send({ message, errors });
  }

  if (err instanceof ApiError) {
    const { message, httpCode, logging, stack } = err;

    if (logging) console.error(JSON.stringify({ httpCode, message, stack }));

    return res.status(httpCode).send({ message });
  }

  console.error(err);
  res.status(500).send({ message: 'Something went wrong' });
};


export function authenticate(request: Request, response: Response, next: NextFunction) {
  const unauthorized = (message: string) => response.status(401).json({
      message: message
  });

  const requestHeader = JWT_HADER_NAME;
  const responseHeader = JWT_RENEWED_HADER_NAME;
  const header = request.header(requestHeader);
  
  if (!header) {
      unauthorized(`Required ${requestHeader} header not found.`);
      return;
  }

  const decodedSession: DecodeResult = decodeSession(header);
  
  if (decodedSession.type === "integrity-error" || decodedSession.type === "invalid-token") {
      unauthorized(`Failed to decode or validate authorization token. Reason: ${decodedSession.type}.`);
      return;
  }

  const expiration: ExpirationStatus = checkExpirationStatus(decodedSession.session);

  if (expiration === "expired") {
      unauthorized(`Authorization token has expired. Please create a new authorization token.`);
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

      response.setHeader(responseHeader, token);
  } else {
      session = decodedSession.session;
  }

  // Set the session on response.locals object for routes to access
  response.locals = {
      ...response.locals,
      session: session
  };
  // Request has a valid or renewed session. Call next to continue to the authenticated route handler
  next();
}
