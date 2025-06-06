import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLAUDINARY_CLOUD_NAME,
    api_key: process.env.CLAUDINARY_API_KEY,
    api_secret: process.env.CLAUDINARY_API_SECRET
});


const uploadOnClaudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        //upload the file on claudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //success
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath);//remove locally saved temporary file as failed to upload
        return null;
    }
}

export { uploadOnClaudinary }; 