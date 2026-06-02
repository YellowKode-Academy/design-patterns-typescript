# Design Patterns na Pratica com TypeScript

Repositorio oficial do livro **Design Patterns na Pratica com TypeScript** (YellowKode Academy).

Projeto **ShopAPI**: plataforma de e-commerce com 15 design patterns GoF implementados em TypeScript 5.x com Node.js 20+.

## Patterns implementados

### Criacionais
- **Singleton** - AppConfig, Logger, DatabaseConnection
- **Factory Method** - NotificationFactory (Email, SMS, Push)
- **Abstract Factory** - PaymentGateway (Stripe, PagSeguro)
- **Builder** - OrderBuilder com encadeamento fluente

### Estruturais
- **Decorator** - ProductService com Cache, Logging compostos
- **Proxy** - LazyProductService com inicializacao lazy
- **Adapter** - LegacyGatewayAdapter para gateway legado
- **Facade** - CheckoutFacade simplificando o processo de checkout
- **Composite** - CategoryTree para arvore de categorias

### Comportamentais
- **Observer** - TypedEventEmitter + OrderEventBus
- **Strategy** - DiscountStrategy (Percentage, Progressive, Premium, Coupon)
- **Command** - ChangePriceCommand + CancelOrderCommand com undo/redo
- **Iterator** - ProductCatalogIterator com filtros lazy
- **Template Method** - ReportGenerator (CSV, JSON, LowStock)
- **Chain of Responsibility** - OrderValidator chain (Stock, Address, Credit, Compliance)

## Requisitos

- Node.js 20+
- npm 9+

## Instalacao

```bash
npm install
```

## Testes

```bash
npm test
```

Com cobertura de codigo:

```bash
npm run test:coverage
```

## Build

```bash
npm run build
```

## Estrutura do projeto

```
src/
  types/               # tipos compartilhados (Product, Order, Cart...)
  creational/          # Singleton, Factory Method, Abstract Factory, Builder
  structural/          # Decorator, Proxy, Adapter, Facade, Composite
  behavioral/          # Observer, Strategy, Command, Iterator, Template Method, Chain

tests/
  creational/
  structural/
  behavioral/
```
