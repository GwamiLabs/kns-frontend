import apolloClient from './client'
import {GEN_KI, 
        AGG_TIME_KI, 
        AGG_ADDR_KI,
        AGG_BENF_KI} from '../graphql'

export async function useGeneralKI(
  beneficiary: string,
  address: string,
  first: number,
  skip: number,
  ordering: string,
  direction: string
) {

    const { data } = await apolloClient.query({
        query: GEN_KI,
        variables:{
          beneficiary:beneficiary,
          address:address,
          first: first,
          skip: skip,
          ordering: ordering,
          direction:direction
        }
      })
    
      return data.klimaRetires

}

export async function useAggTimeKI(
  numPeriods: number,
  periodInSecs: number,
  first: number,
  skip: number,
  mode: string //MAX_COUNT, MAX_AMOUNT, LATEST
) {

    const { data } = await apolloClient.query({
        query: AGG_TIME_KI,
        variables:{
          beneficiary:"",
          address:"",
          first: first,
          skip: skip,
          ordering: "timestamp",
          direction:"asc"
        }
      })
    
      //const periodsInAnalysis = (Date.now()-data.klimaRetires[0]
    
      const totalsByTimestamp = data.klimaRetires.reduce((pv, cv) => {
        let timeshift = Math.floor((Number(Date.now())-Number(cv.timestamp))%periodInSecs)
        if(timeshift >= Math.floor(periodInSecs/2)){
          timeshift *= -1 //more towards the earlier graph point.
        }
        let cvTime = Number(cv.timestamp) + timeshift
        if ( pv[cvTime] ) {
            pv[cvTime] += parseFloat(cv.amount)
        } else {
            pv[cvTime] = parseFloat(cv.amount)
        }
        return pv;
    }, {})
    
      const countsByTimestamp = data.klimaRetires.reduce((pv, cv) => {
        let timeshift = Math.floor((parseInt(Date.now())-parseInt(cv.timestamp))%periodInSecs)
        if(timeshift >= Math.floor(periodInSecs/2)){
          timeshift *= -1 //more towards the earlier graph point.
        }
        let cvTime = Math.floor(Number(cv.timestamp) + timeshift)
        if ( pv[cvTime] ) {
            pv[cvTime] += 1
        } else {
            pv[cvTime] = 1
        }
        return pv;
    }, {})
    
    if (mode === "MAX_AMOUNT"){
      let tempSum=[]
      for(let i in totalsByTimestamp){
        tempSum.push([totalsByTimestamp[i], i])
      }
      return tempSum.sort((pv, cv)=>cv[0]-pv[0]).slice(0,numPeriods)
    } else if (mode === "MAX_COUNT"){
      let tempCount=[]
      for(let i in countsByTimestamp){
        tempCount.push([countsByTimestamp[i], i])
      }
      return tempCount.sort((pv, cv)=>cv[0]-pv[0]).slice(0,numPeriods)
    } else {
        let tempTime=[]
      for(let i in totalsByTimestamp){
        tempTime.push([i, totalsByTimestamp[i]])
      }
      return tempTime.sort((pv, cv)=>cv[0]-pv[0]).slice(0,numPeriods)
    }

}

export async function useAggAddrKI(
  address: string,
  first: number,
  skip: number,
  numUsers: number,
  mode: string
){
  const { data } = await apolloClient.query({
    query: AGG_ADDR_KI,
    variables:{
      beneficiary:"",
      address: address,
      first: first,
      skip: skip,
      ordering: "beneficiary",
      direction:"desc"
    }
  })

  const totalsByAddress = data.klimaRetires.reduce((pv, cv) => {
    if ( pv[cv.beneficiaryAddress] ) {
        pv[cv.beneficiaryAddress] += parseFloat(cv.amount)
    } else {
        pv[cv.beneficiaryAddress] = parseFloat(cv.amount)
    }
    return pv;
}, {})


  const countsByAddress = data.klimaRetires.reduce((pv, cv) => {
    if ( pv[cv.beneficiaryAddress] ) {
        pv[cv.beneficiaryAddress] += 1
    } else {
        pv[cv.beneficiaryAddress] = 1
    }
    return pv;
}, {})

if(mode === "MAX_COUNT"){
  let tempCount=[]
  for(let i in countsByAddress){
      tempCount.push([countsByAddress[i], totalsByAddress[i], i])
  }
  return tempCount.sort((pv, cv)=>cv[0]-pv[0]).slice(0,numUsers)
} else { //MAX_AMOUNT or any other mode
  let tempSum=[]
  for(let i in totalsByAddress){
      tempSum.push([totalsByAddress[i], countsByAddress[i], i])
  }
  return tempSum.sort((pv, cv)=>cv[0]-pv[0]).slice(0,numUsers)
}
}

export async function useAggBenfKI(
  beneficiary: string,
  numUsers: number,
  first: number,
  skip: number,
  mode: string //MAX_AMOUNT, MAX_COUNT and a default
){
  
  const { data } = await apolloClient.query({
    query: AGG_BENF_KI,
    variables:{
      beneficiary:beneficiary,
      address:"",
      first: first,
      skip: skip,
      ordering: "beneficiary",
      direction:"desc"
    }
  })

const totalsByBeneficiary =data.klimaRetires.reduce((pv, cv) => {
    if ( pv[cv.beneficiary] ) {
        pv[cv.beneficiary] += parseFloat(cv.amount)
    } else {
        pv[cv.beneficiary] = parseFloat(cv.amount)
    }
    return pv;
}, {})

const countsByBeneficiary =data.klimaRetires.reduce((pv, cv) => {
    if ( pv[cv.beneficiary] ) {
        pv[cv.beneficiary] += 1
    } else {
        pv[cv.beneficiary] = 1
    }
    return pv;
}, {})

if (mode === "MAX_COUNT"){
  let tempCount=[]
  for(let i in countsByBeneficiary){
      tempCount.push([countsByBeneficiary[i], totalsByBeneficiary[i], i])
  }
  return tempCount.sort((pv, cv)=>cv[0]-pv[0]).slice(0,numUsers)
} else { // MAX_AMOUNT or other modes
  let tempSum=[]
  for(let i in totalsByBeneficiary){
      tempSum.push([totalsByBeneficiary[i], countsByBeneficiary[i], i])
  }
  return tempSum.sort((pv, cv)=>cv[0]-pv[0]).slice(0,numUsers)
}
}
