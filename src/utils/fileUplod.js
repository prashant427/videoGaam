import { v2 as cloudinary } from 'cloudinary';
import { error } from 'console';
import fs from 'fs';

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUD_API_KEY, 
    api_secret: process.env.CLOUD_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const uplodadCloud = async(localFile)=>{
    try {
        if(!localFile)console.error("uplod cloud failed: server error local file not found");
        const responce = await cloudinary.uploader.upload(localFile,{resource_type: "auto"})
        console.log("file uploded to cloud",responce.url );
        return responce;
        
        
        
    } catch (error) {
        fs.unlinkSync(localFile);
    }
}

export {uplodadCloud}
 