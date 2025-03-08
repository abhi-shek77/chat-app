import { supabase } from '../config/supabaseClient';

const upload = async (file) => {
    const fileName = `images/${Date.now()}-${file.name}`;
    
    const { data, error } = await supabase.storage
        .from('chatStorage')  // Replace with your Supabase storage bucket name
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
        });

    if (error) {
        console.error('Upload Error:', error);
        return null;
    }

    // Get the public URL of the uploaded image
    const { data: publicUrl } = supabase.storage
        .from('chatStorage')
        .getPublicUrl(fileName);

    return publicUrl.publicUrl;
};

export default upload;
