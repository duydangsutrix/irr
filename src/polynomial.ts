export type PolynomialSolutionOptions = {
  estimate: number | 'auto',
  epsilon?: number,
  maxIterations?: number,
}

export const DEFAULT_POLYNOMIAL_SOLUTION_OPTIONS: PolynomialSolutionOptions = {
  estimate: 0,
  epsilon: 1e-5,
  maxIterations: 10,
}

export interface IPolynomial {
  calculate (x: number): number
  solve (options?: PolynomialSolutionOptions): number
}

export class Polynomial implements IPolynomial {
  protected derivative: Polynomial | null = null

  constructor (
    protected readonly coefficients: number[],
  ) {}

  protected autoEstimate (): number {
    const { length } = this.coefficients
    const sum = this.coefficients.reduce((total, partial) => total + partial, 0)
    const last = this.coefficients[length - 1]

    return Math.pow(Math.abs(last / (sum - last)), 1 / length)
  }
  protected getDegree (): number {
    return this.coefficients.length - 1
  }

  public calculate (x: number): number {
    const degree = this.getDegree()
    let accumulatedX: number = 1
    let result: number = 0

    for (let index = degree; index >= 0; index--) {
      result += accumulatedX * this.coefficients[index]
      accumulatedX *= x
    }

    return result
  }
  public differentiate (): Polynomial {
    if (this.derivative) {
      return this.derivative
    }

    const degree = this.getDegree()
    const coefficients: number[] = []

    this.coefficients.forEach((coefficient, index) => {
      if (index === degree) {
        return
      }

      coefficients.push(coefficient * (degree - index))
    })

    return this.derivative = new Polynomial(coefficients)
  }
  public getTangentAt (x: number): Line {
    const derivative = this.differentiate()
    const m = derivative.calculate(x)
    const k = this.calculate(x) - m * x

    return new Line(m, k)
  }
  public solve (options: PolynomialSolutionOptions): number {
    options = Object.assign({}, DEFAULT_POLYNOMIAL_SOLUTION_OPTIONS, options)

    const epsilon = options.epsilon!
    const last = Math.abs(this.coefficients[this.coefficients.length - 1]) || 1

    let iteration: number = 0
    let solution: number = options.estimate === 'auto'
      ? this.autoEstimate()
      : options.estimate

    while (iteration++ < options.maxIterations!) {
      const calculated = Math.abs(this.calculate(solution) / last)

      if (calculated < epsilon) {
        break
      }

      const tangent = this.getTangentAt(solution)

      solution = tangent.solve()
    }

    return solution
  }
}
export class Line implements IPolynomial {
  constructor (
    protected readonly m: number,
    protected readonly k: number,
  ) {}

  public calculate (x: number): number {
    return this.m * x + this.k
  }
  public solve (): number {
    return -this.k / this.m
  }
}