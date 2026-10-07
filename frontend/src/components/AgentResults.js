import Link from "next/link";
import StatusBadge from "./StatusBadge";

function CreatedDate({ value }) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}

export default function AgentResults({ items, updating, onDelete }) {
  const updatingClass = updating ? "is-updating" : "";
  return (
    <>
      <div className={`table-wrap ${updatingClass}`}>
        <table className="agent-table">
          <thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>Service area</th><th>Status</th><th>Created</th><th><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>{items.map((agent) => (
            <tr key={agent.id}>
              <td><Link className="agent-name" href={`/agents/${agent.id}`}>{agent.fullName}</Link></td>
              <td>{agent.phone}</td><td className="email-cell">{agent.email}</td><td>{agent.serviceArea}</td>
              <td><StatusBadge status={agent.status} /></td><td><CreatedDate value={agent.createdAt} /></td>
              <td><div className="row-actions">
                <Link href={`/agents/${agent.id}`}>View</Link><Link href={`/agents/${agent.id}/edit`}>Edit</Link>
                <button onClick={(event) => onDelete(agent, event)} type="button">Delete</button>
              </div></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <div className={`agent-cards ${updatingClass}`}>{items.map((agent) => (
        <article className="agent-card" key={agent.id}>
          <div className="agent-card-heading"><Link className="agent-name" href={`/agents/${agent.id}`}>{agent.fullName}</Link><StatusBadge status={agent.status} /></div>
          <p>{agent.phone}</p><p className="email-cell">{agent.email}</p><p>{agent.serviceArea}</p>
          <div className="row-actions">
            <Link href={`/agents/${agent.id}`}>View</Link><Link href={`/agents/${agent.id}/edit`}>Edit</Link>
            <button onClick={(event) => onDelete(agent, event)} type="button">Delete</button>
          </div>
        </article>
      ))}</div>
    </>
  );
}
