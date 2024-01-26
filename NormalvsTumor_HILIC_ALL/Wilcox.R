setwd("/Users/tanmannyc10/Desktop/multiple_batch_trim/Input/trio")
raw.data<- read.csv("PCA_in_LM_NL_match_trio.csv",stringsAsFactors = F)

row<-(raw.data[,1])

idx.I <- grep("LM",colnames(raw.data)) #numerator fc
idx.U <- grep("NL",colnames(raw.data)) #denom fc


U.data <- raw.data[,idx.U]
I.data <- raw.data[,idx.I]
#R.data <- raw.data[,idx.R]


p.result <- lapply(seq(1, nrow(raw.data)), function(i){
  cat(i); cat("\n")
  wilcox.WT.MT <- wilcox.test(as.numeric(I.data[i,]), as.numeric(U.data[i,]), paired=TRUE,alternative="two.sided")
  result <- wilcox.WT.MT$p.value
  return(result)
})

p.result <- do.call(rbind, p.result)
p.result
p.result.adjust.fdr <- p.adjust(p.result[,1], method = "fdr")
p.result.adjust.bon <- p.adjust(p.result[,1], method = "bon")




##fold change

fc<-lapply(seq(1,nrow(raw.data)), function(i){
  cat(i); cat("\n")
  FC<- mean(as.numeric(I.data[i,]))/mean(as.numeric(U.data[i,]));
  result <- FC
  return(result)
})

fc <- do.call(rbind,fc)
fc
logfc<-log2(fc)

###fold change Montana (same patient)
test_fc<-list()
pairs<-(ncol(raw.data)-6)/2

for (n in 1:pairs) {
  
fc_2<-lapply(seq(1,nrow(raw.data)), function(i){
  cat(i); cat("\n")
  FC<- as.numeric(I.data[i,n])/as.numeric(U.data[i,n]);
  result <- FC
  return(result)
})
test_fc[[n]]<-fc_2
}
fcdf<-do.call(cbind,test_fc)

#mean_fc2
means<-lapply(seq(1,nrow(raw.data)),function(i){
  cat(i); cat("\n")
  met_mean<-mean(as.numeric(fcdf[i,]))
  res<-met_mean
  return(res)
})
means <- do.call(rbind,means)
means

#log_fc2
numfcdf<-apply(fcdf,1:2,as.numeric)
logfcdf<-apply(numfcdf,1:2,log2)

logmeans<-lapply(seq(1,nrow(raw.data)),function(i){
  cat(i); cat("\n")
  met2_mean<-mean(as.numeric(logfcdf[i,]))
  res2<-met2_mean
  return(res2)
})
logmeans <- do.call(rbind,logmeans)
logmeans



#build output file
labels<-raw.data[,1:6]
cl<-colnames(raw.data)
end<-length(cl)
samples<-raw.data[,7:end]
headers<-list("raw_pval","q_fdr","q_bon","fc","log_fc","fc_matched","log_fc_matched")

P<-cbind(p.result,p.result.adjust.fdr,p.result.adjust.bon,fc,logfc,means,logmeans)
colnames(P)[1:7]<-headers
out<-cbind(labels,P,samples)
setwd("/Users/tanmannyc10/Desktop/multiple_batch_trim/Output")
write.csv(out, "P_NL_match_trio_stats.csv")
