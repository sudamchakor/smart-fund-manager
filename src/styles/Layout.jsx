import styled from 'styled-components';

export const Flex = styled.div`
  display: flex;
  flex-direction: ${({ direction }) => direction || 'row'};
  justify-content: ${({ justify }) => justify || 'flex-start'};
  align-items: ${({ align }) => align || 'stretch'};
  gap: ${({ gap }) => (gap ? `${gap * 8}px` : '0')}; /* Assuming 8px spacing unit */
  flex-wrap: ${({ wrap }) => wrap || 'nowrap'};
  ${({ fullWidth }) => fullWidth && 'width: 100%;'}
  ${({ fullHeight }) => fullHeight && 'height: 100%;'}
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: ${({ columns }) => columns || '1fr'};
  grid-template-rows: ${({ rows }) => rows || 'auto'};
  gap: ${({ gap }) => (gap ? `${gap * 8}px` : '0')}; /* Assuming 8px spacing unit */
  ${({ fullWidth }) => fullWidth && 'width: 100%;'}
  ${({ fullHeight }) => fullHeight && 'height: 100%;'}
`;

export const Spacer = styled.div`
  width: ${({ x }) => (x ? `${x * 8}px` : '0')};
  height: ${({ y }) => (y ? `${y * 8}px` : '0')};
`;
