import jwt from 'jsonwebtoken';

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  if (event.req.headers.authentication) {
    
    event.context.auth = await jwt.verify(
      event.req.headers.authentication, 
      runtimeConfig.jwtSecret
      )
  }
});
