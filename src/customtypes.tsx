type KexSigData = {
  index: number,
  rtt_ms: number,
  kexName: string,
  sigName: string,
  data: DataPoint[]
}


type DataPoint = {
  fileSize_kb: number,
  median_ms: number,
  percent95_ms: number,
  mean_ms: number,
  pop_variance_ms: number,
}

export type {KexSigData, DataPoint}
