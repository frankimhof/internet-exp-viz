type KexSigData = {
  index: number,
  rtt_ms: number,
  kexName: string,
  sigName: string,
  data: DataPoint[]
}

type KexSigDataMean = {
  index: number,
  rtt_ms: number,
  kexName: string,
  sigName: string,
  data: MeanDataPoint[]
}

type DataPoint = {
  fileSize_kb: number,
  median_ms: number,
  percent95_ms: number,
  mean_ms: number,
  pop_variance_ms: number,
}

type MeanDataPoint = {
  fileSize_kb: number,
  meanOfMedian_ms: number,
  meanOfPercent95_ms: number,
  sampleStdDevOfMedian: number,
  sampleStdDevOfPercent95: number,
}

export type {MeanDataPoint, KexSigData, KexSigDataMean, DataPoint}
