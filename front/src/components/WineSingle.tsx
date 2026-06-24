type Wine = {
  id: number;
  display_name: string;
  color: string;
  type: string;
  sub_type: string;
  residual_sugar: string | null;
  producer: object;
  region: string | null;
};
interface WineProps {
  wine: Wine | null | undefined;
}

const WineSingle = ({ wine }: WineProps) => {
  return (
    <li className="wine">
      <span>
        {wine?.display_name} {wine?.type}
      </span>
    </li>
  );
};

export default WineSingle;
