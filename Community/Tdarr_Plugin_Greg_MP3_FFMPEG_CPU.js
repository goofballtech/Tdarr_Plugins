// eslint-disable-next-line import/no-extraneous-dependencies
const importFresh = require('import-fresh');
const loadDefaultValues = require('../methods/loadDefaultValues');

module.exports.dependencies = ['import-fresh'];
const details = () => ({
  id: 'Tdarr_Plugin_Greg_MP3_FFMPEG_CPU',
  Stage: 'Pre-processing',
  Name: 'Audio Transcode to MP3 using CPU and FFMPEG',
  Type: 'Audio',
  Operation: 'Transcode',
  Description: '[Contains built-in filter] Convert an audio file to mp3, retaining ID3 tags, '
      + 'and at original bitrate up to 320k - from type of: "flac,wav,ape,ogg,m4a,wma,opus" ',
  Version: '0.0.1',
  Tags: 'pre-processing,ffmpeg,audio only',
  Inputs: [
    {
      name: 'codecsToInclude',
      type: 'string',
      defaultValue: 'flac,wav,ape,ogg,m4a,wma,opus',
      inputUI: {
        type: 'text',
      },
      tooltip: `Codecs to exclude
               \\nExample:\\n
               flac,wav,ape,ogg,m4a,wma,opus`,
    },
  ],
});

module.exports.details = details;

// eslint-disable-next-line no-unused-vars
const plugin = (file, librarySettings, inputs, otherArguments) => {
  // eslint-disable-next-line no-unused-vars,no-param-reassign
  inputs = loadDefaultValues(inputs, details);
  const library = importFresh('../methods/library.js');
  const response = {
    // 320K selected over 384k intentionally
    // https://en.m.wikipedia.org/wiki/MPEG-1#Part_3:_Audio
    preset: ', -map_metadata 0 -id3v2_version 3 -b:a 320k',
    container: '.mp3',
    handbrakeMode: false,
    ffmpegMode: true,
    processFile: false,
    reQueueAfter: true,
  };

  const { codecsToInclude } = inputs;

  const filterByCodecInclude = library.filters.filterByCodec(file, 'include', codecsToInclude);
  const filterByCodecExclude = library.filters.filterByCodec(file, 'exclude', 'mp3');

  response.infoLog += `${filterByCodecInclude.note} ${filterByCodecExclude.note}`;

  if ((filterByCodecInclude.outcome
    && filterByCodecExclude.outcome)
    || file.forceProcessing) {
    response.processFile = true;
    return response;
  }
  return response;
};

module.exports.details = details;
module.exports.plugin = plugin;
