import { MediaConvertClient, CreateJobCommand } from "@aws-sdk/client-mediaconvert";

// 1. REPLACE with your endpoint from MediaConvert > Account
const mcEndpoint = "https://817874646995.mediaconvert.af-south-1.amazonaws.com";
const mediaconvert = new MediaConvertClient({ endpoint: mcEndpoint });

export const handler = async (event) => {
    const s3Record = event.Records[0].s3;
    const srcBucket = s3Record.bucket.name;
    const srcKey = decodeURIComponent(s3Record.object.key.replace(/\+/g, " "));

    // Example srcKey: "movies/inception.mp4"
    const pathParts = srcKey.split('/');
    const folder = pathParts[0]; // "movies", "trailer", or "thumbnails"
    const fileNameWithExt = pathParts.pop(); // "inception.mp4"
    const fileName = fileNameWithExt.split('.')[0]; // "inception"

    // Logic: Skip thumbnails, only process videos
    if (folder === 'thumbnails') {
        console.log(`Skipping file in thumbnails folder: ${srcKey}`);
        return;
    }

    // This keeps your output organized: s3://dest-bucket/hls-output/movies/inception/
    const destinationPath = `s3://gospelscreen-video-storage/hls-output/${folder}/${fileName}/`;

    const params = {
        // 2. REPLACE with your MediaConvert Role ARN
        Role: "arn:aws:iam::817874646995:role/MediaConvert_Default_Role",
        Settings: {
            Inputs: [{
                FileInput: `s3://${srcBucket}/${srcKey}`,
                AudioSelectors: { "Audio Selector 1": { DefaultSelection: "DEFAULT" } }
            }],
            OutputGroups: [{
                Name: "Apple HLS",
                OutputGroupSettings: {
                    Type: "HLS_GROUP_SETTINGS",
                    HlsGroupSettings: {
                        SegmentLength: 10,
                        Destination: destinationPath,
                        MinSegmentLength: 0
                    }
                },
                Outputs: [{
                    ContainerSettings: { Container: "M3U8" },
                    VideoDescription: {
                        CodecSettings: {
                            Codec: "H_264",
                            H264Settings: {
                                Bitrate: 5000000, 
                                RateControlMode: "QVBR",
                                SceneChangeDetect: "ENABLED"
                            }
                        }
                    },
                    AudioDescriptions: [{
                        CodecSettings: {
                            Codec: "AAC",
                            AacSettings: { Bitrate: 96000, CodingMode: "CODING_MODE_2_0", SampleRate: 48000 }
                        }
                    }]
                }]
            }]
        }
    };

    try {
        const command = new CreateJobCommand(params);
        await mediaconvert.send(command);
        console.log(`Success! Started ${folder} transcode for: ${fileName}`);
    } catch (error) {
        console.error("Error creating job:", error);
        throw error;
    }
};