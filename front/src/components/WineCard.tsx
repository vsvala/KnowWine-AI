import { Link } from 'react-router-dom';
import { TableRow, TableCell } from '@mui/material';
import type { Wine } from '../types/wine';

type WineCardProps = {
  wine: Wine;
};

const WineCard = ({ wine }: WineCardProps) => (
  <TableRow>
    <TableCell>
      <Link to={`/wines/${wine.id}`}>
        <strong>{wine.display_name}</strong>
      </Link>
    </TableCell>
    <TableCell sx={{ color: '#fff' }}>{wine.type}</TableCell>
    <TableCell sx={{ color: '#fff' }}>{wine.sub_type}</TableCell>
    <TableCell sx={{ color: '#fff' }}>{wine.color}</TableCell>
  </TableRow>
);

export default WineCard;
