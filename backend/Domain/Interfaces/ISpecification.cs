using System.Linq.Expressions;

namespace Domain.Interfaces;

public interface ISpecification<T>
{
    Expression<Func<T, bool>>? Criteria { get; }
    Expression<Func<T, object>>? OrderBy { get; }
    Expression<Func<T, object>>? OrderByDescending { get; }
    List<Expression<Func<T, object>>> Includes { get; } 
    List<string> IncludeStrings { get; }// Then Includes can be handled by chaining
    bool IsDistinct { get; }
    int? Take { get; }
    int? Skip { get; }
    bool IsPagingEnabled { get; }
    IQueryable<T> ApplyCriteria(IQueryable<T> query);
}

// Generic version for specifications that return a projection (TResult)
public interface ISpecification<T, TResult> : ISpecification<T>
{
    Expression<Func<T, TResult>>? Select { get; }
}