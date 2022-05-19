import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core'
import { gql } from 'graphql-tag'
import projectsByID from "../abi/projectsByID.json"

// HTTP connection to the API
const httpLink = createHttpLink({
  // You should use an absolute URL here
  uri:import.meta.env.VITE_API_URL
  //uri: 'https://api.thegraph.com/subgraphs/name/klimadao/polygon-bridged-carbon',
})

let sum: { [key:string]: number } = {} 
let count: { [key:string]: number } = {}
let sumNonce: { [key:string]: boolean } = {}
let countNonce: { [key:string]: boolean } = {}
 

const customCache = new InMemoryCache({
  typePolicies:{
    KlimaRetire:{
      fields:{
        addressTonnes: {
          read(tonnes, { readField } ) {
              tonnes = 0
              const txnHash = String(readField('id', readField('transaction')))
              const address = String(readField('beneficiaryAddress'))
              //const amount2 = String(amount)
              if(address) {
                if (sumNonce[address+txnHash] != true){
                  if (sum[address]){
                    sum[address] += parseFloat(readField('amount'))
                  } else{
                    sum[address] = parseFloat(readField('amount'))
                  }
                  sumNonce[address+txnHash] = true
                }
                tonnes = sum[address]

                console.log("address: ", address , 
                            "sum:", sum[address],
                            "sumNonce: ", sumNonce[address+txnHash])
              }
              return tonnes
              
          }
        },
        addressTimes: {
          read(times, { readField } ) {
              times = 0
              const txnHash = String(readField('id', readField('transaction')))
              const address = String(readField('beneficiaryAddress'))
              
              if(address) {
                if (countNonce[address+txnHash] != true){
                  if (count[address]){
                    count[address] += 1
                  } else{
                    count[address] = 1
                  }
                  countNonce[address+txnHash] = true
                }
                times = count[address]

                console.log("address: ", address , 
                            "count:", count[address],
                            "countNonce: ", countNonce[address+txnHash])
              }
              return times
              
          }
        },
        beneficiaryTonnes: {
          read(tonnes=0, { readField } ) {
              
              const txnHash = String(readField('id', readField('transaction')))
              const beneficiary = String(readField('beneficiary'))
              //const amount2 = String(amount)
              if(beneficiary) {
                if (sumNonce[beneficiary+txnHash] != true){
                  if (sum[beneficiary]){
                    sum[beneficiary] += parseFloat(readField('amount'))
                  } else{
                    sum[beneficiary] = parseFloat(readField('amount'))
                  }
                  sumNonce[beneficiary+txnHash] = true
                }
                tonnes = sum[beneficiary]

                console.log("beneficiary: ", beneficiary , 
                            "sum:", sum[beneficiary],
                            "sumNonce: ", sumNonce[beneficiary+txnHash])
              }
              return tonnes
              
          }
        },

        beneficiaryTimes: {
          read(times=0, { readField } ) {
              
              const txnHash = String(readField('id', readField('transaction')))
              const beneficiary = String(readField('beneficiary'))
              
              if(beneficiary) {
                if (countNonce[beneficiary+txnHash] != true){
                  if (count[beneficiary]){
                    count[beneficiary] += 1
                  } else{
                    count[beneficiary] = 1
                  }
                  countNonce[beneficiary+txnHash] = true
                }
                times = count[beneficiary]

                console.log("project ID:",
                            readField('projectID', readField('offset')))

                console.log("beneficiary: ", beneficiary , 
                            "count:", count[beneficiary],
                            "countNonce: ", countNonce[beneficiary+txnHash])
              }
              return times
              
          }
        },
        //TODO:change logic of projectName to review name etc fields first in case
        //values are provided. Useful for C3.
        projectName: {
          read(name="", { readField } ) {
            const projectID = String(readField('projectID', readField('offset')))
            try{
            let projectDetails = projectsByID[projectID]
            name = projectDetails[0]["Name"]
           } catch {
            name = projectID
           }

            console.log("project ID: ", projectID,
                      ", project name: ", name)
            return name
          }
        },

        addressProjectTonnes: {
          read(tonnes=0, { readField } ) {
              
              const txnHash = String(readField('id', readField('transaction')))
              const address = String(readField('beneficiaryAddress'))
              const projectID = String(readField('projectID', readField('offset')))
              const bridge = String(readField('bridge', readField('offset')))

              //const amount2 = String(amount)
              if(address && bridge) {
                const key = address + projectID + bridge
                if (sumNonce[key+txnHash] != true){
                  if (sum[key]){
                    sum[key] += parseFloat(readField('amount'))
                  } else{
                    sum[key] = parseFloat(readField('amount'))
                  }
                  sumNonce[key+txnHash] = true
                }
                tonnes = sum[key]

                console.log("address: ", address , 
                            "sum:", sum[address],
                            "sumNonce: ", sumNonce[address+txnHash])
              }
              return tonnes
              
          }
        },

        addressProjectTimes: {
          read(times=0, { readField } ) {
              
              const txnHash = String(readField('id', readField('transaction')))
              const address = String(readField('beneficiaryAddress'))
              const projectID = String(readField('projectID', readField('offset')))
              const bridge = String(readField('bridge', readField('offset')))

              //const amount2 = String(amount)
              if(address && bridge) {
                const key = address + projectID + bridge
                if (countNonce[key+txnHash] != true){
                  if (count[key]){
                    count[key] += 1
                  } else{
                    count[key] = 1
                  }
                  countNonce[key+txnHash] = true
                }
                times = count[key]

                console.log("key: ", key , 
                            "count:", count[key],
                            "countNonce: ", countNonce[address+txnHash])
              }
              return times
              
          }
        },

        benfProjectTonnes: {
          read(tonnes=0, { readField } ) {
            
            const txnHash = String(readField('id', readField('transaction')))
            const beneficiary = String(readField('beneficiary'))
            const projectID = String(readField('projectID', readField('offset')))
            const bridge = String(readField('bridge', readField('offset')))

            //const amount2 = String(amount)
            if(beneficiary && bridge) {
              const key = beneficiary + projectID + bridge
              if (sumNonce[key+txnHash] != true){
                if (sum[key]){
                  sum[key] += parseFloat(readField('amount'))
                } else{
                  sum[key] = parseFloat(readField('amount'))
                }
                sumNonce[key+txnHash] = true
              }
              tonnes = sum[key]

              console.log("key: ", key , 
                          "sum:", sum[key],
                          "sumNonce: ", sumNonce[key+txnHash])
            }
            return tonnes
            
        }
      },

      benfProjectTimes: {
        read(times=0, { readField } ) {
          
          const txnHash = String(readField('id', readField('transaction')))
          const beneficiary = String(readField('beneficiary'))
          const projectID = String(readField('projectID', readField('offset')))
          const bridge = String(readField('bridge', readField('offset')))

          //const amount2 = String(amount)
          if(beneficiary && bridge) {
            const key = beneficiary + projectID + bridge
            if (countNonce[key+txnHash] != true){
              if (count[key]){
                count[key] += 1
              } else{
                count[key] = 1
              }
              countNonce[key+txnHash] = true
            }
            times = count[key]

            console.log("key: ", key , 
                        "count:", count[key],
                        "countNonce: ", countNonce[key+txnHash])
          }
          return times
          
        }
      },
      }

    }
  }
})

// Cache implementation
const cache = new InMemoryCache()

// Create the apollo client
const apolloClient = new ApolloClient({
  link: httpLink,
  cache: customCache,
})

export default apolloClient