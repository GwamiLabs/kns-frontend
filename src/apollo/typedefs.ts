import { gql } from 'graphql-tag'

export const typeDefs = gql`
    "Simplified v. of work doodle for testing"
    "N.b. first we should test if we even need typeDefs"
    "typePolicies might suffuce"
    type User {
        "ID Field is Address"
        address: String!
        tonnes: Float
        count: Int
    }

    type Mutation {
        checkSum(address:String!):Float

    }
`

export const userQuery = gql`
{
  Users @client {
    address
    tonnes
  }
}
`