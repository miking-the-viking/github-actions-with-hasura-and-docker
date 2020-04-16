import { ObjectType } from '@nestjs/graphql';
import { BaseUser } from './BaseUser';
import { UserQuery } from '../../../hasura-graphql';

type UserType = UserQuery['users_by_pk'];

@ObjectType()
export class User extends BaseUser {}
