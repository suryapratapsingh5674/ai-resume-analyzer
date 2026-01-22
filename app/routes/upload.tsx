import { AIResponseFormat, prepareInstructions } from 'constants/index';
import { useState, type FormEvent } from 'react'
import FileUploader from '~/components/FileUploader';
import Navbar from '~/components/Navbar'
import { convertPdfToImage } from '~/lib/pdf2image';
import { usePuterStore } from '~/lib/puter';
import { generateUUID } from '~/lib/utils';

const upload = () => {

    const { auth, isLoading, fs, ai, kv } = usePuterStore();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [file, setFile] = useState<File | null>(null)
    const handleFileSelect = (file : File | null) => {
        setFile(file)
    }

    const handleAnalyze = async ({componyName, jobTitle, jobDescription, file} : {componyName:string, jobTitle:string, jobDescription:string, file:File}) => {
        setIsProcessing(true);
        setStatusText('Uploading the file ...');
        const uploadedFile = await fs.upload([file]);
        if(!uploadedFile) return setStatusText('Error: Failed to upload file');

        setStatusText('Converting to image....');
        const imageFile = await convertPdfToImage(file);
        if(!imageFile.file) {
            return setStatusText(
                imageFile.error
                    ? `Error: ${imageFile.error}`
                    : 'Error: Failed to convert PDF to image'
            );
        }

        setStatusText('Uploading the image...');
        const uploadedImage = await fs.upload([imageFile.file]);
        if(!uploadedImage) return setStatusText('Error : failed to upload image');

        setStatusText('Preparing data....');

        const uuid = generateUUID();
        const data = {
            id: uuid,
            resumePath: uploadedFile.path,
            imagePath: uploadedImage.path,
            componyName, jobTitle, jobDescription,
            feedback: '',
        }
        await kv.set(`resume:${uuid}`, JSON.stringify(data));
        setStatusText('Alanyzing...');
        const feedback = await ai.feedback(
            uploadedFile.path,
            prepareInstructions({ jobTitle, jobDescription, AIResponseFormat })
        );
        if(!feedback) return setStatusText('Error: Failed to analyze resume');
        const feedbackText =
            typeof feedback.message.content === 'string'
                ? feedback.message.content
                : feedback.message.content[0]?.text;
        if (!feedbackText) return setStatusText('Error: Invalid feedback response');
        data.feedback = JSON.parse(feedbackText);
        await kv.set(`resume:${uuid}`, JSON.stringify(data));
        setStatusText('Analysis complete, redirecting');
        console.log(data);
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>)=>{
        event.preventDefault();
        const form = event.currentTarget.closest('form');
        if(!form) return;
        const formData = new FormData(form);

        const componyName = formData.get('compony-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if(!file){
            setStatusText('Please upload a resume file before analyzing.');
            return;
        }

        handleAnalyze({componyName, jobTitle, jobDescription, file});
    }

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
        <Navbar/>
        <section className="main-section">
            <div className='page-heading py-8'>
                <h1>Smart feedback for your dream job</h1>
                {isProcessing ? (
                    <>
                    <h2>{statusText}</h2>
                    <img src="images/resume-scan.gif" className='w-[40vh]'/>
                    </>
                ) : (
                    <>
                    <h2>Drop your resume for ATS score and improvement tips</h2>
                    </>
                )}
                {!isProcessing ? (
                    <form id='upload-form' onSubmit={handleSubmit} className='flex flex-col gap-4'>
                        <div className='form-div'>
                            <label htmlFor="compony-name">Compony name</label>
                            <input type="text" name="compony-name" id="compony-name" placeholder='Compony name' />
                        </div>
                        <div className='form-div'>
                            <label htmlFor="job-title">Job Title</label>
                            <input type="text" name="job-title" id="job-title" placeholder='Job Title' />
                        </div>
                        <div className='form-div'>
                            <label htmlFor="job-description">Job Description</label>
                            <textarea rows={5} name="job-description" id="job-description" placeholder='Job Description' />
                        </div>
                        <div className='form-div'>
                            <label htmlFor="upload">Upload</label>
                            <FileUploader onFileSelect={handleFileSelect}/>
                        </div>
                        <button className='primary-button' type='submit'>
                            Analyze Resume
                        </button>
                    </form>
                ) : (
                    <></>
                )}
            </div>
        </section>
    </main>
  )
}

export default upload