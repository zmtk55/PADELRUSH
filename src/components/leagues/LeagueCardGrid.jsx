import LeagueCard from './LeagueCard';

export default function LeagueCardGrid({ leagues, onDelete }) {
  if (!leagues || leagues.length === 0) return null;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {leagues.map(league => (
        <LeagueCard
          key={league.id}
          league={league}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}