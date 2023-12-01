import jwt from 'jsonwebtoken';
import { useAuthenticationStore } from '~/stores/authentication';

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const body = await useBody(event);
  const authenticationStore = useAuthenticationStore()
  const { id } = await User.query().findOne('username', body.username);
  const token = await jwt.sign({ 
    username: authenticationStore.username,
    address: authenticationStore.address,
    database: authenticationStore.database,
  }, runtimeConfig.jwtSecret);
  return token;
});
