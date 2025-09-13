[
{
"AllowedHeaders": ["*", "content-type", "x-amz-acl", "x-amz-date", "authorization", "x-amz-security-token"],
"AllowedMethods": ["GET", "PUT", "HEAD"],
"AllowedOrigins": ["http://localhost:5173", "http://localhost:5174"],
"ExposeHeaders": ["ETag", "x-amz-request-id"],
"MaxAgeSeconds": 3000
}
]
[
{
"AllowedOrigins": ["http://localhost:5173","http://localhost:5174"],
"AllowedMethods": ["GET","POST","PUT","HEAD"],
"AllowedHeaders": ["*"],
"ExposeHeaders": ["ETag","x-amz-request-id"],
"MaxAgeSeconds": 3000
}
]

#Change allowed origins on production (s3-> bucket -> permission -> cors)
