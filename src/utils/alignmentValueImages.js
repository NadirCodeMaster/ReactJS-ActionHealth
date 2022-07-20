import unansweredImage from 'images/alignments/alignment-unanswered.svg';
import zeroPercentImage from 'images/alignments/alignment-0-percent.svg';
import twentyPercentImage from 'images/alignments/alignment-20-percent.svg';
import twentyFivePercentImage from 'images/alignments/alignment-25-percent.svg';
import thirtyThreePercentImage from 'images/alignments/alignment-33-percent.svg';
import fourtyPercentImage from 'images/alignments/alignment-40-percent.svg';
import fiftyPercentImage from 'images/alignments/alignment-50-percent.svg';
import sixtyPercentImage from 'images/alignments/alignment-60-percent.svg';
import sixtySevenPercentImage from 'images/alignments/alignment-67-percent.svg';
import seventyFivePercentImage from 'images/alignments/alignment-75-percent.svg';
import eightyPercentImage from 'images/alignments/alignment-80-percent.svg';
import oneHundredPercentImage from 'images/alignments/alignment-100-percent.svg';

/**
 * Return correct image given an alignment percentage value (.33)
 *
 * @param {string} alignment
 * @returns {jsx} image
 */
export default function alignmentValueImages(alignment) {
  //convert to number for comparison conditional statements
  let alignmentNumber = Number(alignment);

  // use alignment variable here, since Number converts null to 0
  if (!alignment) {
    return unansweredImage;
  }

  if (alignmentNumber >= 0 && alignmentNumber <= 0.19) {
    return zeroPercentImage;
  }

  if (alignmentNumber >= 0.2 && alignmentNumber <= 0.24) {
    return twentyPercentImage;
  }

  if (alignmentNumber >= 0.25 && alignmentNumber <= 0.32) {
    return twentyFivePercentImage;
  }

  if (alignmentNumber >= 0.33 && alignmentNumber <= 0.39) {
    return thirtyThreePercentImage;
  }

  if (alignmentNumber >= 0.4 && alignmentNumber <= 0.49) {
    return fourtyPercentImage;
  }

  if (alignmentNumber >= 0.5 && alignmentNumber <= 0.59) {
    return fiftyPercentImage;
  }

  if (alignmentNumber >= 0.6 && alignmentNumber <= 0.65) {
    return sixtyPercentImage;
  }

  if (alignmentNumber >= 0.66 && alignmentNumber <= 0.74) {
    return sixtySevenPercentImage;
  }

  if (alignmentNumber >= 0.75 && alignmentNumber <= 0.79) {
    return seventyFivePercentImage;
  }

  if (alignmentNumber >= 0.8 && alignmentNumber <= 0.99) {
    return eightyPercentImage;
  }

  if (alignmentNumber === 1) {
    return oneHundredPercentImage;
  }
}
