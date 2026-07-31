import { useState } from 'react';
import styled, { useTheme } from 'styled-components';

import { resolveCategoryColors } from '../../../theme/educonnect.theme';

/**
 * A course thumbnail that never leaves a hole in the layout. If there is no
 * image — or the link is broken — we draw a generated pattern in the category's
 * own colours instead, so the grid still looks composed.
 */

const ThumbnailImage = styled.img`
  display: block;
`;

interface CourseThumbnailProps {
  readonly imageUrl: string;
  readonly category: string;
  readonly title: string;
}

export function CourseThumbnail({
  imageUrl,
  category,
  title,
}: CourseThumbnailProps): JSX.Element {
  const theme = useTheme();
  const [hasImageFailed, setHasImageFailed] = useState(false);

  const shouldShowImage = imageUrl.trim() !== '' && !hasImageFailed;
  if (shouldShowImage) {
    return (
      <ThumbnailImage
        src={imageUrl}
        alt=""
        loading="lazy"
        onError={() => setHasImageFailed(true)}
      />
    );
  }

  const categoryColors = resolveCategoryColors(theme, category);
  // A stable "random" so the same course always gets the same pattern.
  const titleSeed = title.split('').reduce((total, character) => total + character.charCodeAt(0), 0);
  const offsetX = 30 + (titleSeed % 40);
  const offsetY = 24 + (titleSeed % 26);

  return (
    <svg viewBox="0 0 320 180" role="img" aria-label={`${category} course`} preserveAspectRatio="xMidYMid slice">
      <rect width="320" height="180" fill={categoryColors.background} />
      <circle cx={offsetX} cy={offsetY} r="46" fill={categoryColors.foreground} opacity="0.14" />
      <circle cx={280 - offsetY / 2} cy={150} r="62" fill={categoryColors.foreground} opacity="0.10" />
      <path
        d={`M0 ${140 + (titleSeed % 12)} Q80 ${100 + (titleSeed % 20)} 160 ${132 - (titleSeed % 14)} T320 ${118 + (titleSeed % 16)} L320 180 L0 180 Z`}
        fill={categoryColors.foreground}
        opacity="0.12"
      />
      <text
        x="160"
        y="98"
        textAnchor="middle"
        fontFamily={theme.typography.fontFamilyDisplay}
        fontSize="26"
        fontWeight="700"
        fill={categoryColors.foreground}
        opacity="0.62"
      >
        {category}
      </text>
    </svg>
  );
}
