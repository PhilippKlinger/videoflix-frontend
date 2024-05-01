export interface Resolution {
    id: number;
    resolution: string;
    converted_file: string;
    original_video: number;
  }
  
  export interface Video {
    id: number;
    resolutions: Resolution[];
    uploaded_at: string;
    title: string;
    description: string;
    video_file: string;
  }
  