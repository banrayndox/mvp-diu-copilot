import proxy from "express-http-proxy"

const proxyWithHeader = (serviceUrl) => {
    try {
        return proxy(serviceUrl, {
            proxyReqOptDecorator:(proxyReqOpts, srcReq)=> {
                if(srcReq.user){
                    proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
                    if(srcReq.user.email){
                        proxyReqOpts.headers["x-user-email"] = srcReq.user.email;
                    }
                }
            return proxyReqOpts;
        }
        })
    } catch (error) {
        console.log(`Error from gateway:proxyWithHeader`)
    }
}
export default proxyWithHeader