import Image from 'next/image';

// When using Image component:
<Image 
  src={imageUrl}
  alt="Description"
  width={500}
  height={300}
  priority={true} // For important above-the-fold images
/> 