import { ApolloClient, InMemoryCache, gql } from '@apollo/client/core'
//see https://v4.apollo.vuejs.org/guide-advanced/local-state.html#change-local-data-with-mutations
const typeDefs = gql `

    "We need to be careful with non-nullable fields if we are populating across multiple field reads - record could be only partial as it is being populated."
    extend type User {
        "ID Field is address"
        address : String!
        tonnes: Float
        count: Int
        userDomains: [Beneficiary!]
        userKIs : [KlimaRetire!]
        "transferHistory ties user to past domains"
        transferHistory: [DomainTransfer!]
    }
    
    extend type Beneficiary {
        "ID Field is name"
        name: String!
        tonnes: Float
        count: Int
        beneficiaryKIs: [KlimaRetire!]
        "transferHistory would be empty if benf is not a .klima domain"
        transferHistory: [DomainTransfer!]
    }

    "transfers of domains between individuals - probably populated via an ethers events check"
    extend type DomainTransfer {
        id: ID!
        timestamp: Int!
        domainName: String!
        toAddress: String! "we may want to check if we use some form of derivedfrom etc"
        fromAddress: String!
    }

    enum Order {
        ASC
        DESC
    }

    input SortBy {
        field: String!
        order: Order!
    }

    extend
`
"""
Actually, do we need to use the json storage vars in the first place? Can we just store into the cache using cache.readquery to retrieve the value for a certain address (always initialized to a default value) and then cache.writequery to increment or append to it?
"""
/*
https://www.apollographql.com/docs/react/local-state/reactive-variables
"As their name suggests, reactive variables can trigger reactive changes in your application. Whenever you modify the value of a reactive variable, queries that depend on that variable refresh, and your application's UI updates accordingly.""
Basically what this means is that the sum and count functions can trigger a query update for the above type queries. But a polling process might actually be safer.
The safest way I can see to do this is to test whether we can use the sequence of the calls to avoid double-calling.
What I mean is the first section of the call is KlimaRetires, then the next Types called are the local types.
*/


const customCache = new InMemoryCache({
    possibleTypes:
})