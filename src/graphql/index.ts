import { gql } from 'graphql-tag'

const GEN_KI = gql`
query gen_KI($beneficiary:String! $address:String! $first:Int! $skip:Int! $ordering:String! $direction:String! ){
  klimaRetires(
    where:{
      beneficiary_contains_nocase:$beneficiary,
      beneficiaryAddress_contains_nocase:$address
    }
    first:$first , skip:$skip, orderBy: $ordering, orderDirection: $direction) {
    id
    transaction {
      id
    }
    timestamp
    beneficiaryAddress
    beneficiary
    retirementMessage
    pool
    amount
    offset {
      id
      vintage
      projectID
      name
      bridge
    }
  }
}
`
const AGG_BENF_KI = gql`
query agg_benf_KI($beneficiary:String! $address:String! $first:Int! $skip:Int!  $ordering:String! $direction:String! ){
  klimaRetires(
    where:{
      beneficiary_contains_nocase:$beneficiary,
      beneficiaryAddress_contains_nocase:$address
    }
    first:$first , skip:$skip, orderBy: $ordering, orderDirection: $direction) {
    beneficiary
    amount
  }
}
`

const AGG_ADDR_KI = gql`
query agg_addr_KI($beneficiary:String! $address:String! $first:Int! $skip:Int! $ordering:String! $direction:String! ){
  klimaRetires(
    where:{
      beneficiary_contains_nocase:$beneficiary,
      beneficiaryAddress_contains_nocase:$address
    }
    first:$first, skip:$skip, orderBy: $ordering, orderDirection: $direction) {
    beneficiaryAddress
    amount
  }
}
`
const AGG_TIME_KI = gql`
query agg_time_KI($beneficiary:String! $address:String! $first:Int! $skip:Int! $ordering:String! $direction:String! ){
  klimaRetires(
    where:{
      beneficiary_contains_nocase:$beneficiary,
      beneficiaryAddress_contains_nocase:$address
    }
    first:$first , skip:$skip, orderBy: $ordering, orderDirection: $direction) {
    timestamp
    amount
  }
}
`


export {
    GEN_KI,
    AGG_BENF_KI,
    AGG_ADDR_KI,
    AGG_TIME_KI
}