import User from '@/models/User';
import { User as AuthUser } from '@firebase/auth';

export default class CurrentUser extends User {
    authUser: AuthUser|null = null;
}
